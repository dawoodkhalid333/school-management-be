import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Model } from 'mongoose';
import { CreateUser } from '../schema/Signup.schema';
import { CreateUserDTO } from './dto/createUser.dto';
import { LoginDTO } from './dto/login.dto';

const message = 'this is signature message for soul';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(CreateUser.name)
    private readonly _createUserModel: Model<CreateUser>,
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

  async getLogedInUser(user) {
    try {
      return { user };
    } catch (error) {
      console.log('error', error?.message);
      throw new BadRequestException(error?.message);
    }
  }
}
