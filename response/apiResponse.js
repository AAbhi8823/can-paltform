

/**
 * Sends a success response with a message.
 * @param {Object} res - The response object.
 * @param {string} msg - The success message.
 * @returns {Object} The response object with a success status and message.
 */
exports.successResponse=(res,msg)=>{
    let data={
        status:true,
        message:msg
   }
    return res.status(200).json(data);
}

/**
 * Sends a success response with a message and data.
 * @param {Object} res - The response object.
 * @param {string} msg - The success message.
 * @param {Object} data - The data to be sent with the response.
 * @returns {Object} The response object with a success status, message, and data.
 */
exports.successResponseWithData=(res,msg,data)=>{
    let resData={
        status:true,
        message:msg,
       data:data
    }
    return res.status(200).json({resData});

}

exports.successResponseWithOTP=(res,msg,data)=>{
    let resData={
        status:true,
        message:msg,
        otp:data
    }
    return res.status(200).json(resData);
}

 exports.successResponseWithToken=(res,msg,data)=>{
    let resData={
        status:true,
        message:msg,
        token:data
    }
    return res.status(200).json(resData);
}

/**
 * Sends an error response with a message.
 * @param {Object} res - The response object.
 * @param {string} msg - The error message.
 * @returns {Object} The response object with an error status and message.
 */
exports.serverErrorResponse=(res,msg,error)=>{
    let data={
        status:false,
        message:msg,
        error:error
    }
    return res.status(500).json(data);
}

/**
 * Sends a not found response with a message.
 * @param {Object} res - The response object.
 * @param {string} msg - The not found message.
 * @returns {Object} The response object with a not found status and message.
 */
exports.notFoundResponse=(res,msg)=>{
    let data={
        status:false,
        messgae:msg
    }
    res.status(404).json(data);
}

/**
 * Sends a validation error response with a message and data.
 * @param {Object} res - The response object.
 * @param {string} msg - The validation error message.
 * @param {Object} data - The data to be sent with the response.
 * @returns {Object} The response object with a validation error status, message, and data.
 */
exports.validationErrorWithData=(res,msg,data)=>{
    let resData={
        status:false,
        message:msg,
        data:data
    }
    return res.status(400).json(resData);
}

/**
 * Sends an unauthorized response with a message.
 * @param {Object} res - The response object.
 * @param {string} msg - The unauthorized message.
 * @returns {Object} The response object with an unauthorized status and message.
 */
exports.unauthorizedResponse=(res,msg)=>{
    let data={
        status:false,
        message:msg
    }
    return res.status(401).json(data);

}

/**
 * Sends a forbidden response with a message.
 * @param {Object} res - The response object.
 * @param {string} msg - The forbidden message.
 * @returns {Object} The response object with a forbidden status and message.
 */
exports.forbiddenResponse=(res,msg)=>{
    let data={
        status:false,
        message:msg
    }
    return res.status(403).json(data);
}

/**
 * Sends a validation error response with a message.
 * @param {Object} res - The response object.
 * @param {string} msg - The validation error message.
 * @returns {Object} The response object with a validation error status and message.
 */
exports.validationError=(res,msg)=>{
    let data={
        status:false,
        message:msg
    }
    return res.status(400).json(data);
}

/**
 * Sends a token expired error response with a message.
 * @param {Object} res - The response object.
 * @param {string} msg - The token expired error message.
 * @returns {Object} The response object with a token expired error status and message.
 */
exports.tokenExpiredError=(res,msg)=>{
    let data={
        status:false,
        message:msg
    }
    return res.status(419).json(data);
}

exports.requestUnprocessableError=(res,msg)=>{
    let data={
        status:false,
        message:msg
    }
    return res.status(422).json(data);
}


