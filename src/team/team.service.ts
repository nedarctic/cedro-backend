import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from '../r2/r2.service';
import { TeamMemberWhereInput } from '../generated/prisma/models';
import { MemberNotFoundException } from './exceptions/member-not-found.exception';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class TeamService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly r2: R2Service
    ) { }

    // get team members
    async getTeam(search?: string) {
        try {
            const searchTerm = search?.trim();
            const where: TeamMemberWhereInput = searchTerm ? {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    },
                    {
                        designation: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    },
                    {
                        description: {
                            contains: search,
                            mode: 'insensitive',
                        }
                    }
                ]
            } : {};

            return await this.prisma.teamMember.findMany({
                where
            })
        } catch (error) {
            throw error;
        }
    }

    // get team member by id
    async getMember(memberId: string) {
        try {
            const member = await this.prisma.teamMember.findUnique({
                where: {
                    id: memberId
                }
            });

            if (!member) {
                throw new MemberNotFoundException(memberId);
            }

            return member;

        } catch (error) {
            throw error;
        }
    }

    // create member
    async createMember(dto: CreateMemberDto, memberImage: Express.Multer.File) {
        try {
            const { key, publicUrl } = await this.r2.uploadFile(memberImage, "members")

            return await this.prisma.teamMember.create({
                data: {
                    ...dto,
                    memberImageKey: key,
                    memberImageUrl: publicUrl
                }
            })
        } catch (error) {
            throw error;
        }
    }

    // update member
    async updateMember(memberId: string, dto: UpdateMemberDto, memberImage?: Express.Multer.File) {
        try {
            const member = await this.prisma.teamMember.findUnique({
                where: {
                    id: memberId
                }
            });

            if (!member) {
                throw new MemberNotFoundException(memberId);
            }

            const { key, publicUrl } = memberImage && memberImage.size > 0 ? await this.r2.uploadFile(memberImage, "members") : {};

            memberImage && memberImage.size > 0 && await this.r2.deleteFile(member.memberImageKey);

            return await this.prisma.teamMember.update({
                where: {
                    id: memberId,
                },
                data: {
                    ...dto,
                    memberImageKey: key,
                    memberImageUrl: publicUrl,
                }
            })
        } catch (error) {
            throw error;
        }
    }

    // delete member
    async deleteMember(memberId: string) { 
        try {
            const member = await this.prisma.teamMember.findUnique({
                where: {
                    id: memberId
                }
            });

            if(!member) {
                throw new MemberNotFoundException(memberId);
            }

            await this.r2.deleteFile(member.memberImageKey);

            return await this.prisma.teamMember.delete({
                where: {
                    id: memberId
                }
            })
        } catch (error) {
            throw error;
        }
    }
}
