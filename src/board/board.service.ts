import { Injectable, NotFoundException } from '@nestjs/common';
import { BoardRepository } from './board.repository';
import { Board } from './board.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { BoardStatus } from './board-status.enum';
import { User } from '../auth/user.entity';

@Injectable()
export class BoardService {
  constructor(private boardRepository: BoardRepository) {}

  async getAllBoard(user: User): Promise<Board[]> {
    const query = this.boardRepository
      .createQueryBuilder('board')
      .where('board.user_id = :userId', { userId: user.id });
    return await query.getMany();
  }

  async getBoard(id: number): Promise<Board> {
    const result = await this.boardRepository.findOne({ where: { id } });
    if (!result) {
      throw new NotFoundException(`Can't find board with id ${id}`);
    }
    return result;
  }

  async create(createBoardDto: CreateBoardDto, user: User): Promise<Board> {
    return this.boardRepository.crate(createBoardDto, user);
  }

  async delete(id: number, userId: number): Promise<void> {
    const result = await this.boardRepository
      .createQueryBuilder()
      .delete()
      .from(Board)
      .where('id = :id', { id })
      .andWhere('user_id = :userId', { userId })
      .execute();
    if (result.affected === 0) {
      throw new NotFoundException(`Can't find board id with ${id}`);
    }
  }

  async updateBoardStatus(id: number, status: BoardStatus): Promise<Board> {
    const board = await this.getBoard(id);
    board.status = status;

    await this.boardRepository.save(board);
    return board;
  }
}
