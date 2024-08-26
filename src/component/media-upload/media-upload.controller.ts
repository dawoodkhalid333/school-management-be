import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Param,
  Get,
  Res,
  UseGuards,
  HttpException,
  HttpStatus,
  Query,
  Body,
  Req,
} from '@nestjs/common';
import { extname } from 'path';
import { diskStorage } from 'multer';
import * as path from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiTags, ApiConsumes } from '@nestjs/swagger';
import * as fs from 'fs';
const jimp = require('jimp');
import { MediaUploadService } from './media-upload.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';
import { UtilsService } from 'src/component/utils/utils.service';

export const fileFilter = (req, file, callback) => {
  let ext = path.extname(file.originalname);
  // console.log(ext);
  // console.log(process.env.whiteListedExtensions);
  if (!process.env.whiteListedExtensions.includes(ext.toLowerCase())) {
    req.fileValidationError = 'Invalid file type';
    return callback(
      new HttpException('Invalid file type', HttpStatus.BAD_REQUEST),
      false,
    );
  }
  return callback(null, true);
};

export const csvFilter = (req, file, callback) => {
  let ext = path.extname(file.originalname);
  if (ext !== '.csv') {
    req.fileValidationError = 'Invalid file type';
    return callback(
      new HttpException('Invalid file type', HttpStatus.BAD_REQUEST),
      false,
    );
  }
  return callback(null, true);
};

@ApiTags('media-upload')
@Controller('media-upload')
@ApiBearerAuth()
export class MediaUploadController {
  constructor(
    private _mediaUploadService: MediaUploadService,
    private _utilsService: UtilsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('mediaFiles/:folderName')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      storage: diskStorage({
        destination: function (req, file, cb) {
          const dir =
            'mediaFiles/metasuite/' + req.params.folderName.toLowerCase();

          fs.exists(dir, (exist) => {
            if (!exist) {
              return fs.mkdir(dir, { recursive: true }, (error) =>
                cb(error, dir),
              );
            }
            return cb(null, dir);
          });
        },
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');

          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadAvatar(
    @UploadedFile() file,
    @Param('folderName') folderName: string,
    @Req() req,
  ) {
    req.setTimeout(10 * 60 * 1000);
    file['url'] =
      process.env.URL +
      'media-upload/mediaFiles/' +
      folderName.toLowerCase() +
      '/' +
      file.filename;
    // console.log('***************+++++++++++++++++++++++***************');
    // console.log({ file });
    // console.log('***************+++++++++++++++++++++++***************');

    let type = '';
    const nameSplit = file['filename'].split('.');
    if (nameSplit.length > 1) {
      type = nameSplit[1];
    }

    const allowTypes = ['.jpg', '.jpeg', '.png'];

    if (type && allowTypes.includes(`.${type}`)) {
      try {
        const img = await jimp.read(file['path']);

        const height = img.bitmap.height;
        const width = img.bitmap.width;

        this._mediaUploadService.compressImageTo300(file);
        if ((height < 500 && width < 275) || file.size <= 500 * 1000) {
          return file;
        }

        const heightRatio = height / width;
        const widthRatio = width / height;

        // console.log({ height });
        // console.log({ width });
        // console.log({ heightRatio });
        // console.log({ widthRatio });

        file['path'] = file['path'].replace(
          file['filename'],
          `compressed/${file['filename']}`,
        );

        img.resize(500 * widthRatio, jimp.AUTO).write(file['path']);
      } catch (err) {
        console.log(err);
      }
    }
    // console.log('***************====================***************');
    // console.log(file);
    // console.log('***************====================***************');
    return file;
  }

  @UseGuards(JwtAuthGuard)
  @Post('readCsv')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: csvFilter,
      storage: diskStorage({
        destination: function (req, file, cb) {
          const dir =
            'mediaFiles/metasuite/' +
            `${Math.random().toString(36).substring(7)}.csv`;

          fs.exists(dir, (exist) => {
            if (!exist) {
              return fs.mkdir(dir, { recursive: true }, (error) =>
                cb(error, dir),
              );
            }
            return cb(null, dir);
          });
        },
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');

          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadCsv(@UploadedFile() file, @Req() req) {
    req.setTimeout(10 * 60 * 1000);

    // console.log(file);
    // console.log('***************====================***************');
    const data = await this._utilsService.readCsvFile(file);
    return {
      data: data,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('mediaFiles/:folderName/:fileName')
  async mediaFiles(
    @Param('folderName') folderName: string,
    @Param('fileName') fileName: string,
    @Res() res,
    @Req() req,
    @Query('size') size: string = 'original',
  ): Promise<any> {
    req.setTimeout(10 * 60 * 1000);
    const sizeArray = ['original', 'compressed'];
    size = sizeArray.includes(size) ? size : 'original';
    folderName = folderName.toLowerCase();
    const url =
      process.env.URL +
      'media-upload/mediaFiles/' +
      folderName +
      '/' +
      fileName;
    // console.log('***************====================***************');

    if (size == 'original') {
      res.sendFile(fileName, {
        root: 'mediaFiles/metasuite/' + folderName,
      });
    } else {
      const dir =
        'mediaFiles/metasuite/' + folderName + '/' + size + '/' + fileName;
      const exists = fs.existsSync(dir);
      if (!exists) {
        res.sendFile(fileName, {
          root: 'mediaFiles/metasuite/' + folderName,
        });
        return;
      }

      res.sendFile(fileName, {
        root: 'mediaFiles/metasuite/' + folderName + '/' + size,
      });
    }
  }
}
