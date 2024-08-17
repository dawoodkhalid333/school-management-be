import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Model } from 'mongoose';
import { CreateUser } from '../schema/Signup.schema';
import { CreateUserDTO } from './dto/createUser.dto';
import { LoginDTO } from './dto/login.dto';
import { CheckInOut, CheckInOutDocument } from '../schema/CheckInOut.schema';
import { ChangePasswordDTO } from './dto/changePassword.dto';

const message = 'this is signature message for soul';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(CreateUser.name)
    private readonly _createUserModel: Model<CreateUser>,
    @InjectModel(CheckInOut.name)
    private readonly _checkInOutModel: Model<CheckInOutDocument>,
  ) {}

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
        name: user.name,
        email: user.email,
        // isAdmin: user.isAdmin,
        // isSuperAdmin: user.isSuperAdmin,
        role: user.role,
      };

      const token = this.generateJwtToken(payload);
      return {
        id: user._id,
        name: user.name,
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
      return { user };
    } catch (error) {
      console.log('error', error?.message);
      throw new BadRequestException(error?.message);
    }
  }

  async getCheckInTimes() {
    try {
      const getAll = await this._checkInOutModel.aggregate([
        {
          $lookup: {
            from: 'createusers', // The collection name for users (replace 'users' with the actual collection name)
            localField: 'userId', // The field in the checkInOut model
            foreignField: '_id', // The field in the user collection
            as: 'userDetails', // The name of the new field to add
          },
        },
        {
          $unwind: '$userDetails', // Deconstruct the userDetails array to get a single object
        },
        {
          $project: {
            _id: 0, // Exclude the _id from the output
            userId: 1, // Include userId
            time: 1, // Include time
            'userDetails.name': 1, // Include specific fields from userDetails
            'userDetails.email': 1, // Include specific fields from userDetails
            'userDetails.status': 1, // Include specific fields from userDetails
            'userDetails.role': 1, // Include specific fields from userDetails
          },
        },
      ]);

      return getAll; // Return the processed data
    } catch (error) {
      console.error('Error during getCheckInTimes:', error);
      throw new Error('Could not get data');
    }
  }

  async checkIn(user) {
    try {
      const checkIn = new this._checkInOutModel({
        userId: user.id,
        time: new Date(), // current time for check-in
      });
      console.log(user);
      const userDetail = await this._createUserModel.findById(user?.id);
      console.log(userDetail, 'dssssssssssssssssss');
      userDetail.status = true;
      await userDetail.save();
      await checkIn.save();
      // Save the new check-in record

      return { success: true, message: 'Check-in successful', checkIn };
    } catch (error) {
      console.error('Error during check-in:', error);
      throw new Error('Could not complete check-in');
    }
  }

  async checkOut(user) {
    try {
      const checkOut = new this._checkInOutModel({
        userId: user.id,
        time: new Date(), // current time for check-in
      });

      const userDetail = await this._createUserModel.findById(user?.id);
      console.log(userDetail, 'dssssssssssssssssss');
      userDetail.status = false;
      await userDetail.save();
      await checkOut.save();
      // Save the new check-in record

      return { success: true, message: 'Check-in successful', checkOut };
    } catch (error) {
      console.error('Error during check-in:', error);
      throw new Error('Could not complete check-out');
    }
  }
}
