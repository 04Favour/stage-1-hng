import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesModule } from './profile.module';
import { Profile } from './profile.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: "postgresql://postgres.nkyhkwtmzklrafzojgze:Imaabasi123$@aws-0-eu-west-1.pooler.supabase.com:6543/postgres",
      entities: [Profile],
      synchronize: true,
      ssl: { rejectUnauthorized: false },
    }),
    ProfilesModule,
  ],
})
export class AppModule {}