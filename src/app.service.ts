import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { AxiosError } from 'axios'
import { firstValueFrom } from 'rxjs'
import { Cron } from '@nestjs/schedule'

interface ServerConfig {
  name: string
  healthCheckUrl: string
  discordWebhook: string
  timeout: number
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name)
  private readonly servers: ServerConfig[]
  private lastStatus = new Map<string, boolean>()
  private serverDownTimes = new Map<string, number>()

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.servers = this.configService.get<ServerConfig[]>('servers') || []
  }

  @Cron('0 * * * * *') // Run every minute
  async checkServers() {
    for (const server of this.servers) {
      try {
        this.logger.log(`Checking servers ${server.name}`)

        const requestConfig: any = {
          timeout: server.timeout,
          validateStatus: () => true,
        }
        if (server.healthCheckUrl.includes('://')) {
          const url = new URL(server.healthCheckUrl)
          requestConfig.family = 4
        }

        const response = await firstValueFrom(
          this.httpService.get(server.healthCheckUrl, requestConfig))

        const isUp = response.status >= 200 && response.status < 300
        const wasUp = this.lastStatus.get(server.name) !== false

        if (!isUp && wasUp) {
          await this.handleDown(server, wasUp)
        } else if (isUp && !wasUp) {
          await this.handleUp(server)
        }

        this.updateStatus(server.name, isUp)
      } catch (error) {
        this.logger.error(`Error checking ${server.name}: ${error.message}`)
        const wasUp = this.lastStatus.get(server.name) !== false

        if (wasUp) {
          await this.handleDown(server, wasUp)
        }

        this.updateStatus(server.name, false)
      }
    }
  }

  private async handleDown(server: ServerConfig, wasUp: boolean) {
    this.logger.warn(`Server ${server.name} is DOWN`)

    const payload = {
      embeds: [
        {
          title: '🔴 Server Down Alert',
          description: `The server **${server.name}** is currently unavailable.`,
          color: 15158332, // Red
          fields: [
            {
              name: 'Server Name',
              value: server.name,
              inline: true,
            },
            {
              name: 'Status',
              value: '❌ Offline',
              inline: true,
            },
            {
              name: 'Health Check URL',
              value: `\`${server.healthCheckUrl}\``,
              inline: false,
            },
            {
              name: 'Time',
              value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
              inline: false,
            },
          ],
          footer: {
            text: 'Server Monitor Bot',
          },
          timestamp: new Date().toISOString(),
        },
      ],
    }

    await this.sendDiscordMessage(server.discordWebhook, payload)
  }

  private async handleUp(server: ServerConfig) {
    this.logger.log(`Server ${server.name} is back UP`)

    const payload = {
      embeds: [
        {
          title: '🟢 Server Back Online',
          description: `The server **${server.name}** is back online and operational.`,
          color: 3066993, // Green
          fields: [
            {
              name: 'Server Name',
              value: server.name,
              inline: true,
            },
            {
              name: 'Status',
              value: '✅ Online',
              inline: true,
            },
            {
              name: 'Health Check URL',
              value: `\`${server.healthCheckUrl}\``,
              inline: false,
            },
            {
              name: 'Time',
              value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
              inline: false,
            },
            {
              name: 'Downtime',
              value: this.calculateDowntime(server.name),
              inline: false,
            },
          ],
          footer: {
            text: 'Server Monitor Bot',
          },
          timestamp: new Date().toISOString(),
        },
      ],
    }

    await this.sendDiscordMessage(server.discordWebhook, payload)
  }

  private updateStatus(serverName: string, isUp: boolean) {
    const previousStatus = this.lastStatus.get(serverName)

    if (previousStatus !== false && !isUp) {
      this.serverDownTimes.set(serverName, Date.now())
    }

    this.lastStatus.set(serverName, isUp)
  }

  private calculateDowntime(serverName: string): string {
    const downTime = this.serverDownTimes.get(serverName)
    if (!downTime) return 'Unknown'

    const downTimeMs = Date.now() - downTime
    const seconds = Math.floor(downTimeMs / 1000)

    if (seconds < 60) {
      return `${seconds} seconds`
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)} minutes, ${seconds % 60} seconds`
    } else {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return `${hours} hours, ${minutes} minutes`
    }
  }

  private async sendDiscordMessage(webhookUrl: string, payload: any) {
    try {
      await firstValueFrom(
        this.httpService.post(webhookUrl, payload, {
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? `${error.message}: ${JSON.stringify(error.response?.data)}`
          : error.message

      this.logger.error(`Failed to send message to Discord: ${errorMessage}`)
    }
  }
}
