import multer from "multer";
import path from "node:path";

const path_to_images = path.resolve("./images");
const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, path_to_images);
    },

    filename: (req, file, cb) => {
        const extention = path.extname(file.originalname);
        const file_name = `${crypto.randomUUID()}${extention}`

        cb(null, file_name);
    }
})

const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
    const permited_extentions = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if(permited_extentions.includes(file.mimetype))
        cb(null, true);
    else
        cb(new Error(`O formato ${file.mimetype} não eh permitido`));


}

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 10
    }
})