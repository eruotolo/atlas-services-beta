import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { CrmService } from './crm.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('CRM')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Obtener los datos del Kanban para el panel del Profesional' })
  getDashboard(@Request() req: any) {
    // req.user.id es el ID del proveedor
    return this.crmService.getKanbanDashboard(req.user.id);
  }
}
