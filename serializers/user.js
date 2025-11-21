const userSerializer = (user) => {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
        //we've excluded password for security purposes
    };
};

module.exports = { userSerializer };