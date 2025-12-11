using EducationalSystem.Models;
using Microsoft.AspNetCore.SignalR;

namespace EducationalSystem.Repositories;

public interface IAuthRepository
{
    public User SaveUser(string email, string password, string name);
    public void RefreshPassword(string oldPassword, string newPassword);
    public User Login(string email, string password);
    public void BlockUser(long userId, string accessKey);
}