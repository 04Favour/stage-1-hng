import {
  Controller, Get, Post, Delete,
  Body, Param, Query, HttpCode
} from '@nestjs/common';
import { ProfilesService } from './profile.service';
import { CreateProfileDto, FilterProfilesDto } from './profile.dto';

@Controller('/api/profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateProfileDto) {
    return this.profilesService.create(dto);
  }

  @Get()
  findAll(@Query() filters: FilterProfilesDto) {
    return this.profilesService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.profilesService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.profilesService.remove(id);
  }
}