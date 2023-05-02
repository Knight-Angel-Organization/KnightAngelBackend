const verifyRoles = (...allowedRoles) => {
    return(req, res, next) =>{
        if(!req?.roles) return res.sendStatus(401);
        const rolesArray = [...allowedRoles];
        console.log(rolesArray);
        console.log(req.roles);
        const result = req.roles.map(role => rolesArray.includes(role)).find(val => val === true); 
        //https://youtu.be/fUWkVxCv4IQ?list=PL0Zuz27SZ-6PFkIxaJ6Xx_X46avTM1aYw&t=1078
        if(!result) return res.sendStatus(401);
        next();
    }
}

module.exports = verifyRoles;