const multer = require('multer')
const fs = require('fs')
const path = require('path')

// const storage = multer.diskStorage({
//     destination : (req, files, callback) => {
//         const dir = "Uploads"

//         // if (!fs.existsSync(dir)) {
//         //     fs.mkdirSync(dir)
//         // }

//         callback(null, dir)
//     },
//     filename : (req, files, callback)=>{
//         callback(null, files.fieldname+'-'+Date.now()+ path.extname(files.originalname))
//         console.log(files)
//     },
//     // limits : {
//     //     fileSize : 100*100
//     // }
// })

// const storage = multer.diskStorage({
//     destination: (req, files, callback) => {
//         const dir = "Uploads"

//         if (!fs.existsSync(__dirname + dir)) {
//             fs.mkdirSync(__dirname + dir)
//         }

//         callback(null, __dirname + dir)
//         console.log(__dirname + dir)
//     },
//     filename: (req, files, callback) => {
//         callback(null, files.fieldname + '-' + Date.now() + path.extname(files.originalname))
//         console.log(files)
//     },
//     // limits : {
//     //     fileSize : 100*100
//     // }
// })


const storage = multer.memoryStorage({
    destination: (req, file, callback) => {
        // const dir = "/UploadImage"

       
        callback(null, '')
        console.log(__dirname + dir)
    },
    filename: (req, file, callback) => {
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
        console.log(file)
    },
    // limits : {
    //     fileSize : 100*100
    // }
})

const Upload = multer({ storage: storage })
module.exports = Upload