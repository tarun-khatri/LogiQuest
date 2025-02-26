import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile-dto.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private users: User[] = [];

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const timestamp = new Date();

    const newUser: User = {
      id: Date.now(),
      ...createUserDto,
      password: hashedPassword,
      createdAt: timestamp,
      updatedAt: timestamp,
      walletAddress: createUserDto.walletAddress || '',
    };

    this.users.push(newUser);
    console.log('DB Password:', process.env.DB_PASSWORD);
    return newUser;
  }

  async getProfile(userId: string): Promise<User> {
    const user = this.users.find((u) => u.id === Number(userId));
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = this.users.find((u) => u.id === Number(userId));
    if (!user) throw new NotFoundException('User not found');

    Object.assign(user, dto);
    return { message: 'Profile updated successfully', user };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = this.users.find((u) => u.id === Number(userId));
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) throw new ForbiddenException('Incorrect old password');

    user.password = await bcrypt.hash(dto.newPassword, 10);
    return { message: 'Password updated successfully' };
  }

  async deactivateAccount(userId: string) {
    const userIndex = this.users.findIndex((u) => u.id === Number(userId));
    if (userIndex === -1) throw new NotFoundException('User not found');

    this.users.splice(userIndex, 1);
    return { message: 'Account deactivated successfully' };
  }

  async getAllUsers(): Promise<User[]> {
    return this.users;
  }

  async getUserById(userId: string): Promise<User> {
    const user = this.users.find((u) => u.id === Number(userId));
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async deleteUser(userId: string) {
    const userIndex = this.users.findIndex((u) => u.id === Number(userId));
    if (userIndex === -1) throw new NotFoundException('User not found');

    this.users.splice(userIndex, 1);
    return { message: 'User deleted successfully' };
  }
}
