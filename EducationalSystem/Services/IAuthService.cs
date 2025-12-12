using EducationalSystem.Models;

namespace EducationalSystem.Services;

public interface IAuthService
{
    Task<(User? User, string Token)> RegisterUserAsync(string email, string password, string name);
    Task<(Admin? Admin, string Token)> RegisterAdminAsync(string email, string password, string name, string accessKey);
    Task<(Tutor? Tutor, string Token)> RegisterTutorAsync(string email, string password, string name, int experience, string specialty);
    Task<(User? User, string Token)> LoginAsync(string email, string password);
    Task<bool> ChangePasswordAsync(long userId, string oldPassword, string newPassword);
    Task<bool> BlockUserAsync(long userId);
    bool IsAdmin(User user);
    bool IsTutor(User user);
}