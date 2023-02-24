const multer = require('multer')
const fs = require('fs')
const path = require('path')

const storage = multer.diskStorage({
    destination : (req, files, callback) => {
        const dir = "Uploads"

        // if (!fs.existsSync(dir)) {
        //     fs.mkdirSync(dir)
        // }

        callback(null, dir)
    },
    filename : (req, files, callback)=>{
        callback(null, files.fieldname+'-'+Date.now()+ path.extname(files.originalname))
        console.log(files)
    },
    // limits : {
    //     fileSize : 100*100
    // }
})

const upload = multer({storage : storage})
module.exports = upload