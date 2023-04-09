import path from 'path';
import fs from 'fs';

const cleanImage = filePath =>{
    filePath= path.join(path.join(path.dirname(process.cwd()),'express-GraphqlwebApp','images',filePath));
    fs.unlink(filePath,err=> console.log(err));
}

export default cleanImage;