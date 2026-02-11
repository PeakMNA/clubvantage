import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { ShareableLinkService } from './shareable-link.service';

@ApiTags('Share')
@Controller({ path: 'share', version: '1' })
export class ShareableLinkController {
  constructor(private readonly linkService: ShareableLinkService) {}

  @Public()
  @Get(':token')
  @ApiOperation({ summary: 'View a shared invoice or receipt' })
  @ApiParam({ name: 'token', description: 'Shareable link token' })
  @ApiQuery({ name: 'password', required: false, description: 'Link password if protected' })
  @ApiResponse({ status: 200, description: 'Entity data returned' })
  @ApiResponse({ status: 404, description: 'Link not found or expired' })
  async resolveShareableLink(
    @Param('token') token: string,
    @Query('password') password?: string,
  ) {
    return this.linkService.resolveLink(token, password);
  }
}
