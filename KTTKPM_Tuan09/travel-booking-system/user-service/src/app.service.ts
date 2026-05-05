import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AppService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async login(username: string, password?: string): Promise<any> {
    const user = await this.userModel.findOne({ username });
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    if (password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return { success: false, message: 'Incorrect password' };
      }
    }
    
    const userObj = user.toObject();
    const { password: _, ...userData } = userObj;
    return { success: true, data: { ...userData, id: userObj._id.toString() } };
  }

  async register(userData: any): Promise<any> {
    const existing = await this.userModel.findOne({ username: userData.username });
    if (existing) {
      return { success: false, message: 'Username already exists' };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const newUser = new this.userModel({
      ...userData,
      password: hashedPassword,
      balance: 10000
    });
    
    await newUser.save();
    
    const userObj = newUser.toObject();
    const { password, ...userRes } = userObj;
    return { success: true, data: { ...userRes, id: userObj._id.toString() } };
  }

  async getUser(id: string): Promise<any> {
    try {
      const user = await this.userModel.findById(id);
      if (!user) {
        return { success: false, message: 'User not found' };
      }
      const userObj = user.toObject();
      const { password, ...userData } = userObj;
      return { success: true, data: { ...userData, id: userObj._id.toString() } };
    } catch(err) {
      return { success: false, message: 'Invalid ID format' };
    }
  }

  async deductBalance(id: string, amount: number): Promise<any> {
    try {
      const user = await this.userModel.findById(id);
      if (!user) return { success: false, message: 'User not found' };
      if (user.balance < amount) return { success: false, message: 'Insufficient balance' };
      
      user.balance -= amount;
      await user.save();
      
      return { success: true, balance: user.balance };
    } catch(err) {
      return { success: false, message: 'Invalid ID format' };
    }
  }

  async addNotification(id: string, message: string): Promise<any> {
    try {
      const user = await this.userModel.findById(id);
      if (!user) return { success: false, message: 'User not found' };
      
      const newNotification = {
        id: new Date().getTime().toString() + Math.random().toString(36).substring(7),
        message,
        date: new Date(),
        read: false
      };
      
      user.notifications.push(newNotification);
      await user.save();
      return { success: true, notification: newNotification };
    } catch(err) {
      return { success: false, message: 'Invalid ID format' };
    }
  }

  async markNotificationRead(id: string, notifId: string): Promise<any> {
    try {
      const user = await this.userModel.findById(id);
      if (!user) return { success: false, message: 'User not found' };
      
      const notif = user.notifications.find(n => n.id === notifId);
      if (notif) {
        notif.read = true;
        user.markModified('notifications');
        await user.save();
      }
      return { success: true };
    } catch(err) {
      return { success: false, message: 'Invalid ID format' };
    }
  }
}
