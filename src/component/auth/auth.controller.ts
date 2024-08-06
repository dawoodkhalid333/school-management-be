import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
  Get,
  Query,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { CreateUserDTO } from './dto/createUser.dto';
import { LoginDTO } from './dto/login.dto';
import { JwtAuthGuard, JwtSuperAdminAuthGuard } from './jwt.strategy';
import { User } from 'src/decorator/user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('createAdmin')
  @ApiBearerAuth()
  @UseGuards(JwtSuperAdminAuthGuard)
  @UseGuards(JwtAuthGuard)
  adminRegisteration(
    @Body() createAdmin: CreateUserDTO,
    @Res({ passthrough: true }) response: Response,
    @Req() req: Request,
  ) {
    response.cookie('key', 'value');
    return this.authService.createAdmin(createAdmin);
  }

  @Get('getAllAdmins')
  @ApiBearerAuth()
  @UseGuards(JwtSuperAdminAuthGuard)
  @UseGuards(JwtAuthGuard)
  async getAllAdmins(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ) {
    limit = limit || 10; // default limit
    offset = offset || 0; // default offset
    return this.authService.getAllAdmins(limit, offset);
  }

  @Post('deleteAdmin/:id')
  @ApiBearerAuth()
  @UseGuards(JwtSuperAdminAuthGuard)
  @UseGuards(JwtAuthGuard)
  async deleteAdmin(@Param('id') adminId: string) {
    return this.authService.deleteAdmin(adminId);
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    const data = await this.authService.login(loginDto);
    const { token } = data;
    response.cookie('token', token, { httpOnly: true, secure: true });
    return this.authService.login(loginDto);
  }

  @ApiBearerAuth()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('getLogedInUser')
  getLoggedUser(@User() user) {
    return this.authService.getLogedInUser(user);
  }
}
