const profileSerializer = (profile) => {
    if (!profile) return null;
    return {
        id: profile.id,
        bio: profile.bio,
        location: profile.location,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
         //we've excluded password for security purposes
    };
};

const userWithProfileSerializer = (user) => {
    return {
        ...userWithProfileSerializer(user), // Spread basic user data
        profile: profileSerializer(user.Profile) //Assume Profile is eagerly loaded
    };
};

module.exports = { userSerializer, userWithProfileSerializer };