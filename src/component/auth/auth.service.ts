import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Model } from 'mongoose';
import { CreateUser } from '../schema/Signup.schema';
import { CreateUserDTO } from './dto/createUser.dto';
import { LoginDTO } from './dto/login.dto';
import { CheckInOut, CheckInOutDocument } from '../schema/CheckInOut.schema';
import { ChangePasswordDTO } from './dto/changePassword.dto';
import { Cron } from '@nestjs/schedule';
import { DocumentValidationDTO } from './dto/documentValidation.dto';
import { RegistrationFeeDTO } from './dto/collectRegistrationFee.dto';

const message = 'this is signature message for soul';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(CreateUser.name)
    private readonly _createUserModel: Model<CreateUser>,
    @InjectModel(CheckInOut.name)
    private readonly _checkInOutModel: Model<CheckInOutDocument>,
  ) {}

  @Cron('0 18 * * *') // This cron expression runs every day at 6 PM
  async handleAutoCheckOut() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of the day

      const usersToCheckOut = await this._createUserModel.find({
        status: true, // Users who are checked in
      });

      for (const user of usersToCheckOut) {
        // Check if the user has checked in today and hasn't checked out
        const existingCheckIn = await this._checkInOutModel.findOne({
          userId: user.id,
          time: { $gte: today },
        });

        if (existingCheckIn) {
          // Perform check-out
          const checkOut = new this._checkInOutModel({
            userId: user.id,
            time: new Date(), // current time for auto check-out
          });

          user.status = false;
          await user.save();
          await checkOut.save();

          console.log(`Auto check-out completed for user: ${user.id}`);
        }
      }
    } catch (error) {
      console.log('Error during auto check-out:', error);
    }
  }

  private generateJwtToken(payload: any): string {
    const token = `Bearer ${jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '4h',
    })}`;
    return token;
  }

  async createAdmin(createUserDto: CreateUserDTO) {
    try {
      const existingUser = await this._createUserModel.findOne({
        email: createUserDto.email.toLowerCase(),
      });

      if (existingUser) {
        throw new BadRequestException('Email address is already registered');
      }

      createUserDto.email = createUserDto.email.toLowerCase();
      const createUser = new this._createUserModel(createUserDto);

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10); // 10 is the salt rounds
      createUser.password = hashedPassword;

      await createUser.save();

      const { password, ...userWithoutSensitiveData } = createUser.toObject();

      return { user: userWithoutSensitiveData };
    } catch (error) {
      console.log('error', error?.message);
      throw new BadRequestException(error?.message);
    }
  }
  async getAllAdmins(limit: number, offset: number) {
    try {
      const admins = await this._createUserModel
        .find({ role: 'ADMIN' })
        .select('-password')
        .skip(offset)
        .limit(limit);
      return { admins };
    } catch (error) {
      console.log('error', error?.message);
      throw new BadRequestException(error?.message);
    }
  }
  async deleteAdmin(adminId: string) {
    try {
      const result = await this._createUserModel.findByIdAndDelete(adminId);
      if (!result) {
        throw new BadRequestException('Admin not found');
      }
      return { message: 'Admin deleted successfully' };
    } catch (error) {
      console.log('error', error?.message);
      throw new BadRequestException(error?.message);
    }
  }

  async createStudent(createUserDto: CreateUserDTO) {
    try {
      const existingUser = await this._createUserModel.findOne({
        email: createUserDto.email.toLowerCase(),
      });

      if (existingUser) {
        throw new BadRequestException('Email address is already registered');
      }
      if (createUserDto.role !== 'STUDENT') {
        throw new BadRequestException('Only the STUDENT role is allowed.');
      }

      createUserDto.email = createUserDto.email.toLowerCase();
      const createUser = new this._createUserModel(createUserDto);

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10); // 10 is the salt rounds
      createUser.password = hashedPassword;

      await createUser.save();

      const { password, ...userWithoutSensitiveData } = createUser.toObject();

      return { user: userWithoutSensitiveData };
    } catch (error) {
      console.log('error', error?.message);
      throw new BadRequestException(error?.message);
    }
  }

  async approveStudent(studentId: string) {
    const student = await this._createUserModel.findById(studentId);

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    student.isApproved = true;
    await student.save();

    return { message: 'Student registration approved' };
  }

  async getAllStudents(limit: number, offset: number) {
    try {
      const admins = await this._createUserModel
        .find({ role: 'STUDENT' })
        .select('-password')
        .skip(offset)
        .limit(limit);
      return { admins };
    } catch (error) {
      console.log('error', error?.message);
      throw new BadRequestException(error?.message);
    }
  }

  async validateDocuments(
    studentId: string,
    documentValidation: DocumentValidationDTO,
  ) {
    try {
      // Find the student by ID
      const student = await this._createUserModel.findById(studentId);

      if (!student) {
        throw new NotFoundException('Student not found');
      }

      // Update the document validation status
      student.birthCertificateValid = documentValidation.birthCertificateValid;
      student.schoolRecordsValid = documentValidation.schoolRecordsValid;
      student.photoValid = documentValidation.photoValid;

      // Save the updated student document
      await student.save();

      return { message: 'Documents validated successfully' };
    } catch (error) {
      console.log('error', error?.message);
      throw new BadRequestException(error?.message);
    }
  }

  async collectRegistrationFee(studentId: string, feeDto: RegistrationFeeDTO) {
    try {
      // Find the student by ID
      const student = await this._createUserModel.findById(studentId);

      if (!student) {
        throw new NotFoundException('Student not found');
      }

      // Update the registration fee details
      student.feeAmount = feeDto.feeAmount;
      student.feeStatus = feeDto.feeStatus;
      student.feePaymentDate = feeDto.feeStatus ? feeDto.feePaymentDate : null;

      // Save the updated student document
      await student.save();

      return { message: 'Registration fee recorded successfully' };
    } catch (error) {
      console.log('error', error?.message);
      throw new BadRequestException(error?.message);
    }
  }

  async getNotApprovedStudents(limit: number, offset: number) {
    try {
      const students = await this._createUserModel
        .find({ role: 'STUDENT', isApproved: false })
        .select('-password')
        .skip(offset)
        .limit(limit);
      return { students };
    } catch (error) {
      console.log('error', error?.message);
      throw new BadRequestException(error?.message);
    }
  }
  async deleteStudent(id: string) {
    try {
      const result = await this._createUserModel.findByIdAndDelete(id);
      if (!result) {
        throw new BadRequestException('Student not found');
      }
      return { message: 'Student deleted successfully' };
    } catch (error) {
      console.log('error', error?.message);
      throw new BadRequestException(error?.message);
    }
  }

  async createTeacher(createUserDto: CreateUserDTO) {
    try {
      const existingUser = await this._createUserModel.findOne({
        email: createUserDto.email.toLowerCase(),
      });

      if (existingUser) {
        throw new BadRequestException('Email address is already registered');
      }

      createUserDto.email = createUserDto.email.toLowerCase();
      const createUser = new this._createUserModel(createUserDto);

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10); // 10 is the salt rounds
      createUser.password = hashedPassword;

      await createUser.save();

      const { password, ...userWithoutSensitiveData } = createUser.toObject();

      return { user: userWithoutSensitiveData };
    } catch (error) {
      console.log('error', error?.message);
      throw new BadRequestException(error?.message);
    }
  }
  async getAllTeachers(limit: number, offset: number) {
    try {
      const admins = await this._createUserModel
        .find({ role: 'TEACHER' })
        .select('-password')
        .skip(offset)
        .limit(limit);
      return { admins };
    } catch (error) {
      console.log('error', error?.message);
      throw new BadRequestException(error?.message);
    }
  }
  async deleteTeacher(id: string) {
    try {
      const result = await this._createUserModel.findByIdAndDelete(id);
      if (!result) {
        throw new BadRequestException('Teacher not found');
      }
      return { message: 'Teacher deleted successfully' };
    } catch (error) {
      console.log('error', error?.message);
      throw new BadRequestException(error?.message);
    }
  }

  async login(loginDto: LoginDTO) {
    try {
      loginDto.email = loginDto?.email?.toLowerCase();
      const user = await this._createUserModel.findOne({
        email: loginDto.email,
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      const isPasswordMatch = await bcrypt.compare(
        loginDto.password,
        user.password,
      );

      if (!isPasswordMatch) {
        throw new BadRequestException('Invalid password');
      }

      const payload = {
        id: user._id,
        name: user.fullName,
        email: user.email,
        // isAdmin: user.isAdmin,
        // isSuperAdmin: user.isSuperAdmin,
        role: user.role,
      };

      const token = this.generateJwtToken(payload);
      return {
        id: user._id,
        name: user.fullName,
        email: user.email,
        // isAdmin: user.isAdmin,
        // isSuperAdmin: user.isSuperAdmin,
        role: user.role,
        token,
      };
    } catch (error) {
      console.log('error', error?.message);
      throw new BadRequestException(error?.message);
    }
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDTO) {
    try {
      const user = await this._createUserModel.findById(userId);

      if (!user) {
        throw new BadRequestException('User not found');
      }

      const isPasswordMatch = await bcrypt.compare(
        changePasswordDto.oldPassword,
        user.password,
      );

      if (!isPasswordMatch) {
        throw new BadRequestException('Old password is incorrect');
      }

      const isSamePassword = await bcrypt.compare(
        changePasswordDto.newPassword,
        user.password,
      );

      if (isSamePassword) {
        throw new BadRequestException(
          'New password cannot be the same as the old password',
        );
      }

      const hashedNewPassword = await bcrypt.hash(
        changePasswordDto.newPassword,
        10,
      );
      user.password = hashedNewPassword;

      await user.save();

      return { message: 'Password changed successfully' };
    } catch (error) {
      console.log('error', error?.message);
      throw new BadRequestException(error?.message);
    }
  }

  async getLogedInUser(user) {
    try {
      const userData = await this._createUserModel.findById(user?.id);

      return userData;
    } catch (error) {
      console.log('error', error?.message);
      throw new BadRequestException(error?.message);
    }
  }

  async getCheckInTimes(userId, startDate, endDate) {
    try {
      // Prepare the date range filter
      const dateFilter: any = {};
      if (startDate) {
        dateFilter.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.$lte = new Date(endDate);
      }

      const matchConditions: any = {};
      if (userId) {
        matchConditions.userId = userId; // Filter by user ID if provided
      }
      if (startDate || endDate) {
        matchConditions.parsedTime = dateFilter; // Filter by date range if provided
      }

      const attendanceData = await this._checkInOutModel.aggregate([
        {
          $addFields: {
            // Clean up the time string to remove the unwanted timezone parts
            cleanTime: {
              $substr: ['$time', 0, 24], // Extracts "Sun Aug 18 2024 11:11:53"
            },
          },
        },
        {
          $addFields: {
            // Convert cleanTime to UTC
            parsedTime: {
              $dateFromString: {
                dateString: '$cleanTime',
                timezone: 'UTC', // Force the timezone to UTC
              },
            },
          },
        },
        { $match: matchConditions }, // Match documents based on filters
        { $sort: { parsedTime: 1 } }, // Sort by parsedTime within each date
        {
          $group: {
            _id: {
              userId: '$userId',
              date: {
                $dateToString: { format: '%Y-%m-%d', date: '$parsedTime' },
              }, // Group by user and date
            },
            checkIn: { $first: '$parsedTime' }, // Get the first check-in time
            checkOut: { $last: '$parsedTime' }, // Get the last check-out time
          },
        },
        {
          $lookup: {
            from: 'createusers', // Replace with your actual users collection name
            localField: '_id.userId', // The userId in the checkInOut model
            foreignField: '_id', // The _id in the user collection
            as: 'userDetails',
          },
        },
        { $unwind: '$userDetails' }, // Flatten the userDetails array
        {
          $project: {
            _id: 0,
            date: '$_id.date', // Show date
            checkIn: 1, // Show check-in time
            checkOut: {
              $cond: {
                if: { $eq: ['$checkIn', '$checkOut'] },
                then: null, // No check-out if check-in and check-out times are the same
                else: '$checkOut',
              },
            },
            'userDetails.name': 1, // Include user's name
            'userDetails.email': 1, // Include user's email
            'userDetails.status': 1, // Include user's status
            'userDetails.role': 1, // Include user's role
            'userDetails.id': '$userDetails._id', // Rename user's _id to id
          },
        },
        { $sort: { date: -1 } }, // Sort by date in descending order
      ]);

      return attendanceData;
    } catch (error) {
      console.error('Error during getCheckInTimes:', error);
      throw new Error('Could not get data');
    }
  }

  async checkIn(user) {
    try {
      // Check if the user has already checked in today
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of the day
      const existingCheckIn = await this._checkInOutModel.findOne({
        userId: user.id,
        time: { $gte: today }, // Check for any check-in today
      });

      if (existingCheckIn) {
        return {
          success: false,
          message: 'User has already checked in today.',
        };
      }

      // Proceed with check-in
      const checkIn = new this._checkInOutModel({
        userId: user.id,
        time: new Date(), // current time for check-in
      });

      const userDetail = await this._createUserModel.findById(user.id);
      userDetail.status = true;
      await userDetail.save();
      await checkIn.save();

      return { success: true, message: 'Check-in successful', checkIn };
    } catch (error) {
      console.error('Error during check-in:', error);
      throw new Error('Could not complete check-in');
    }
  }

  async checkOut(user) {
    try {
      // Check if the user has checked in today and hasn't checked out yet
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of the day
      const existingCheckIn = await this._checkInOutModel.findOne({
        userId: user.id,
        time: { $gte: today },
      });

      if (!existingCheckIn) {
        return { success: false, message: 'User has not checked in today.' };
      }

      // Proceed with check-out
      const checkOut = new this._checkInOutModel({
        userId: user.id,
        time: new Date(), // current time for check-out
      });

      const userDetail = await this._createUserModel.findById(user.id);
      userDetail.status = false;
      await userDetail.save();
      await checkOut.save();

      return { success: true, message: 'Check-out successful', checkOut };
    } catch (error) {
      console.error('Error during check-out:', error);
      throw new Error('Could not complete check-out');
    }
  }
}
