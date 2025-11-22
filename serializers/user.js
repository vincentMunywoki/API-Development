const userSerializer = (user) => {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

const profileSerializer = (profile) => {
  if (!profile) return null;
  return {
    id: profile.id,
    bio: profile.bio,
    location: profile.location,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt
  };
};

const userWithProfileSerializer = (user) => {
  return {
    ...userSerializer(user), // ✅ Spread basic user data
    profile: profileSerializer(user.Profile) // Assume Profile is eagerly loaded
  };
};

module.exports = { userSerializer, userWithProfileSerializer };
