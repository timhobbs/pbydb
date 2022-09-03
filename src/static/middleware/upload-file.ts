import * as multer from 'multer';
import * as path from 'path';
import * as util from 'util';

export const uploadPath = path.resolve(`${__dirname}/../assets/uploads`);

console.log('***** uploadPath', uploadPath);

// CSV storage setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath)
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const uploadFile = multer({ storage: storage }).single('file');

export const upload = util.promisify(uploadFile);
