import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ServiceRequestsService } from './service-requests.service';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Service Requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('service-requests')
export class ServiceRequestsController {
  constructor(private readonly serviceRequestsService: ServiceRequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo Service Request (Project Wizard)' })
  create(@Request() req: any, @Body() createServiceRequestDto: CreateServiceRequestDto) {
    return this.serviceRequestsService.create(req.user.id, createServiceRequestDto);
  }

  @Get('available')
  @ApiOperation({ summary: 'Listar Service Requests disponibles para cotizar (vista del profesional)' })
  findAvailable(@Request() req: any) {
    return this.serviceRequestsService.findAvailableForProvider(req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar los Service Requests del usuario autenticado' })
  findAll(@Request() req: any) {
    return this.serviceRequestsService.findAllByUser(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener el detalle de un Service Request por ID' })
  findOne(@Param('id') id: string) {
    return this.serviceRequestsService.findOne(id);
  }
}
