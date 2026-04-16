import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesModule } from './profile.module';
import { Profile } from './profile.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL! || "postgresql://postgres:Imaabasi123$@localhost:5432/postgres",
      entities: [Profile],
      synchronize: true,
      // ssl: { rejectUnauthorized: false },
    }),
    ProfilesModule,
  ],
})
export class AppModule {}