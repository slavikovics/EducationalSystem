using EducationalSystem.Models;

namespace EducationalSystem.Services;

public interface IAuthService
{
    User SaveUser(string email, string password, string name);
    void RefreshPassword(string oldPassword, string newPassword);
    User Login(string email, string password);
    void BlockUser(long userId, string accessKey);
}