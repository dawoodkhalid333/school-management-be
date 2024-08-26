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
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { CreateUserDTO } from './dto/createUser.dto';
import { LoginDTO } from './dto/login.dto';
import {
  JwtAdminAuthGuard,
  JwtAuthGuard,
  JwtSuperAdminAuthGuard,
} from './jwt.strategy';
import { User } from 'src/decorator/user.decorator';
import { ChangePasswordDTO } from './dto/changePassword.dto';
import { DocumentValidationDTO } from './dto/documentValidation.dto';
import { RegistrationFeeDTO } from './dto/collectRegistrationFee.dto';

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

  @Post('createStudent')
  @ApiBearerAuth()
  @UseGuards(JwtAdminAuthGuard)
  @UseGuards(JwtAuthGuard)
  createStudent(
    @Body() createStudent: CreateUserDTO,
    @Res({ passthrough: true }) response: Response,
    @Req() req: Request,
  ) {
    response.cookie('key', 'value');
    return this.authService.createStudent(createStudent);
  }

  @Post('approveStudent')
  @ApiBearerAuth()
  @UseGuards(JwtAdminAuthGuard)
  @UseGuards(JwtAuthGuard)
  approveStudent(@Param('studentId') studentId: string) {
    return this.authService.approveStudent(studentId);
  }

  @Post('validateDocuments')
  @ApiBearerAuth()
  @UseGuards(JwtAdminAuthGuard)
  @UseGuards(JwtAuthGuard)
  validateDocuments(
    @Param('studentId') studentId: string,
    @Body() documentValidationDto: DocumentValidationDTO,
  ) {
    return this.authService.validateDocuments(studentId, documentValidationDto);
  }

  @Post('collectRegistrationFee')
  @ApiBearerAuth()
  @UseGuards(JwtAdminAuthGuard)
  @UseGuards(JwtAuthGuard)
  collectRegistrationFee(
    @Param('studentId') studentId: string,
    @Body() feeDto: RegistrationFeeDTO,
  ) {
    return this.authService.collectRegistrationFee(studentId, feeDto);
  }

  @Post('createTeacher')
  @ApiBearerAuth()
  @UseGuards(JwtAdminAuthGuard)
  @UseGuards(JwtAuthGuard)
  createTeacher(
    @Body() createTeacher: CreateUserDTO,
    @Res({ passthrough: true }) response: Response,
    @Req() req: Request,
  ) {
    response.cookie('key', 'value');
    return this.authService.createTeacher(createTeacher);
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

  @Get('getNotApprovedStudents')
  @ApiBearerAuth()
  @UseGuards(JwtAdminAuthGuard)
  @UseGuards(JwtAuthGuard)
  async getNotApprovedStudents(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ) {
    limit = limit || 10; // default limit
    offset = offset || 0; // default offset
    return this.authService.getNotApprovedStudents(limit, offset);
  }

  @Get('getAllStudents')
  @ApiBearerAuth()
  @UseGuards(JwtAdminAuthGuard)
  @UseGuards(JwtAuthGuard)
  async getAllStudents(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ) {
    limit = limit || 10; // default limit
    offset = offset || 0; // default offset
    return this.authService.getAllStudents(limit, offset);
  }

  @Get('getAllTeachers')
  @ApiBearerAuth()
  @UseGuards(JwtAdminAuthGuard)
  @UseGuards(JwtAuthGuard)
  async getAllTeachers(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ) {
    limit = limit || 10; // default limit
    offset = offset || 0; // default offset
    return this.authService.getAllTeachers(limit, offset);
  }

  @Post('deleteAdmin/:id')
  @ApiBearerAuth()
  @UseGuards(JwtSuperAdminAuthGuard)
  @UseGuards(JwtAuthGuard)
  async deleteAdmin(@Param('id') adminId: string) {
    return this.authService.deleteAdmin(adminId);
  }

  @Post('deleteStudent/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAdminAuthGuard)
  @UseGuards(JwtAuthGuard)
  async deleteStudent(@Param('id') id: string) {
    return this.authService.deleteStudent(id);
  }

  @Post('deleteTeacher/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAdminAuthGuard)
  @UseGuards(JwtAuthGuard)
  async deleteTeacher(@Param('id') id: string) {
    return this.authService.deleteTeacher(id);
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

  @Post('changePassword')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @User() user,
    @Body() changePasswordDto: ChangePasswordDTO,
  ) {
    return this.authService.changePassword(user.id, changePasswordDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAdminAuthGuard)
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'userId', required: false, type: String, example: '' })
  @ApiQuery({ name: 'startDate', required: false, type: String, example: '' })
  @ApiQuery({ name: 'endDate', required: false, type: String, example: '' })
  @Get('getCheckInTimes')
  getCheckInTimes(
    @Query('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.authService.getCheckInTimes(userId, startDate, endDate);
  }

  @ApiBearerAuth()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('getLogedInUser')
  getLoggedUser(@User() user) {
    return this.authService.getLogedInUser(user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('checkIn')
  checkIn(@User() user) {
    return this.authService.checkIn(user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('checkOut')
  checkOut(@User() user) {
    return this.authService.checkOut(user);
  }
}
