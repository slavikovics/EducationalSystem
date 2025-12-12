using EducationalSystem.Models;

namespace EducationalSystem.Services;

public interface ITokenService
{
    string GenerateToken(User user);
    long? ValidateToken(string token);
}