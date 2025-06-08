import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { ScheduleModule } from '@nestjs/schedule'
import { ConfigModule } from '@nestjs/config'
import configuration from './config/configuration'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
  ],
  providers: [AppService],
})
export class AppModule {}
