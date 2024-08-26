import { Injectable } from '@nestjs/common';
// import { SendEmailDTO } from './dto/email.dto';
import imagesize from 'image-size';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';
// const PinataSDK = require('@pinata/sdk');
// const crypto = require('crypto');

// const formData = require('form-data');

@Injectable()
export class UtilsService {
  // private mailgun;
  // private mailgunClient;
  // private pinata;
  constructor() {
    // this.mailgun = require('mailgun-js')
    //     ({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN, host: "api.eu.mailgun.net" });
    // // this.mailgun = new Mailgun(formData);
    // // this.mailgunClient = this.mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY, url: process.env.MAILGUN_BASE_URL })
    // this.pinata = new PinataSDK({ pinataJWTKey: process.env.PINATA_JWT_TOKEN })
  }

  // async sendEmail(emailDto: SendEmailDTO) {
  //     try {
  //         console.log(emailDto);
  //         // const msg = await this.mailgunClient.messages.create(process.env.MAILGUN_DOMAIN, emailDto)
  //         // return msg;
  //         const emailResponse = this.mailgun.messages().send(emailDto, function (error, body) {
  //             if (error) console.log(error)
  //             else console.log(body);
  //         });

  //         return emailResponse
  //     }
  //     catch (err) {
  //         console.log(err);
  //         throw new BadRequestException(err?.message);
  //     }
  // }

  async getDimensionsFromImageUrl(imageUrl: string) {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
      });

      const dimensions = await imagesize(response?.data);

      return dimensions;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // async uploadJsonToPinata(jsonData: Object) {
  //   try {
  //     const pinata = new PinataSDK({
  //       pinataJWTKey: process.env.PINATA_JWT_TOKEN,
  //     });
  //     await pinata.testAuthentication();

  //     const res = await pinata.pinJSONToIPFS(jsonData);

  //     const pinataUrl = `${process.env.BASE_IPFS_URL}/${res.IpfsHash}`;

  //     return {
  //       url: pinataUrl,
  //       hash: res.IpfsHash,
  //     };
  //   } catch (error) {
  //     console.log(error);
  //     return null;
  //   }
  // }

  //   async uploadImageToPinata(imageUrl: string) {
  //     try {
  //       const pinata = new PinataSDK({
  //         pinataJWTKey: process.env.PINATA_JWT_TOKEN,
  //       });

  //       await pinata.testAuthentication();
  //       const response = await axios.get(imageUrl, {
  //         responseType: 'arraybuffer',
  //       });

  //       // save the image to filesystem
  //       const filePath = path.resolve('image.jpg');

  //       fs.writeFileSync(filePath, response.data);

  //       const formData = new FormData();
  //       const file: any = fs.createReadStream(filePath);
  //       formData.append('file', file);

  //       const pinataOptions = JSON.stringify({
  //         cidVersion: 0,
  //       });

  //       formData.append('pinataOptions', pinataOptions);

  //       const pinataMetadata = JSON.stringify({
  //         name: 'File name',
  //       });
  //       formData.append('pinataMetadata', pinataMetadata);

  //       const options = {
  //         pinataMetadata: {
  //           name: 'Test name',
  //           keyvalues: {
  //             customKey: 'customValue',
  //             customKey2: 'customValue2',
  //           },
  //         },
  //         pinataOptions: {
  //           cidVersion: 0,
  //         },
  //       };

  //       const res = await pinata.pinFileToIPFS(file, options);

  //       const pinataUrl = `${process.env.BASE_IPFS_URL}/${res.IpfsHash}`;
  //       // delete the file from filesystem
  //       fs.unlinkSync(filePath);
  //       return {
  //         url: pinataUrl,
  //         hash: res.IpfsHash,
  //       };
  //     } catch (error) {
  //       console.log(error);
  //       return 'N/A';
  //     }
  //   }

  // file binary
  async readCsvFile(file: any) {
    try {
      const filePath = file?.path;

      const results = [];

      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', () => {
            resolve(results);
          })
          .on('error', (err) => {
            console.log(err);
            reject(err);
          });
      });
      return results;
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}
