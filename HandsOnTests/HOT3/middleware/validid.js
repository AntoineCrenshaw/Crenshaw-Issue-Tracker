import { ObjectId } from "mongodb";
import debug from 'debug';
const debugValidId = debug('app:ValidId');

const validId = (paramName) => {
    return (req, res, next) => {
        try{
            req[paramName] = new ObjectId(req.params[paramName]);
            debugValidId(`Converted ${paramName}: ${req[paramName]}`);
            return next();
        }catch(err){
            return res.status(400).json({ error: `${paramName} was not a valid ObjectId`});
        };
    }
}

export { validId };