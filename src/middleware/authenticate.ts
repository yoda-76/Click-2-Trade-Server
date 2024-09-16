import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const {atc, rtc} = req.cookies 
    // console.log("cookies: ",token);;
    // const token =req.body.token
    console.log("accesstoken",atc);
    if (!atc) {
        return res.status(401).send('Access denied. No token or invalid token provided.');
    }

    

    try {
        // const decoded = jwt.verify(atc, process.env.JWT_ACCESS_SECRET as string);
        const decoded = jwt.verify(atc, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
          if (err) {
            if (err.name === 'TokenExpiredError') {
              // return res.status(401).json({ message: 'Access token expired' });
              console.log("expired");
              //refresh both tokens 

              // return new Error('Access token expired');
              return {message:"Access token expired"}
            }
            // return res.status(403).json({ message: 'Invalid access token' });
            console.log("invalid");
            // return new Error('Invalid access token');
            return {message:"Invalid access token"}
          }
      
          // req.locals.user = decoded; // Add decoded information (like userId) to the request
          // console.log("decoded1", decoded);
          return decoded
        });
        // console.log(decoded);
        res.locals.user = decoded;        
        next();
    } catch (err) {
        res.status(400).send('Invalid token');
    }
};


//////////////////////////////////////////////

export const authenticate = (authHeader) => {
    try {
      
    // const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
      console.log(authHeader, !token)
    if (!token) {
      // return res.status(401).json({ message: 'Access token missing' });
      console.log("missing access token");
      // return new Error('Access token missing');
      return {message:"missing access token"}
    }
  
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          // return res.status(401).json({ message: 'Access token expired' });
          console.log("expired");
          // return new Error('Access token expired');
          return {message:"Access token expired"}
        }
        // return res.status(403).json({ message: 'Invalid access token' });
        console.log("invalid");
        // return new Error('Invalid access token');
        return {message:"Invalid access token"}
      }
  
      // req.locals.user = decoded; // Add decoded information (like userId) to the request
      // console.log("decoded1", decoded);
      return decoded
    });
    return decoded
    } catch (error) {
      console.log(error);
      return error
    }
  };
  
  