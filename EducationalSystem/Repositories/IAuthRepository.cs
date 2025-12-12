using EducationalSystem.Models;
using Microsoft.AspNetCore.SignalR;

namespace EducationalSystem.Repositories;

public interface IAuthRepository
{
    Task<User> SaveUserAsync(string email, string password, string name);
    Task RefreshPasswordAsync(long userId, string oldPassword, string newPassword);
    Task<User> LoginAsync(string email, string password);
    Task BlockUserAsync(long userId, long adminUserId);
    Task<bool> IsAdminAsync(long userId);
    Task<bool> IsTutorAsync(long userId);
}