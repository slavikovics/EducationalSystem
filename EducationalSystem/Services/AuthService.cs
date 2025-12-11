using EducationalSystem.Models;
using EducationalSystem.Repositories;
using Microsoft.AspNetCore.Identity;

namespace EducationalSystem.Services;

public class AuthService : IAuthService
{
    private readonly IAuthRepository _authRepository;
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;

    public AuthService(
        IAuthRepository authRepository,
        UserManager<User> userManager,
        SignInManager<User> signInManager)
    {
        _authRepository = authRepository;
        _userManager = userManager;
        _signInManager = signInManager;
    }

    public User SaveUser(string email, string password, string name)
    {
        return _authRepository.SaveUser(email, password, name);
    }

    public void RefreshPassword(string oldPassword, string newPassword)
    {
        _authRepository.RefreshPassword(oldPassword, newPassword);
    }

    public User Login(string email, string password)
    {
        return _authRepository.Login(email, password);
    }

    public void BlockUser(long userId, string accessKey)
    {
        _authRepository.BlockUser(userId, accessKey);
    }

    public async Task<IdentityResult> RegisterAsync(string email, string password, string name, string role = "User")
    {
        var user = new User
        {
            Email = email,
            Password = password,
            Name = name,
            Status = UserStatus.Active
        };

        var result = await _userManager.CreateAsync(user, password);

        if (result.Succeeded && !string.IsNullOrEmpty(role))
        {
            await _userManager.AddToRoleAsync(user, role);
        }

        return result;
    }

    public async Task<SignInResult> LoginAsync(string email, string password, bool rememberMe = false)
    {
        return await _signInManager.PasswordSignInAsync(email, password, rememberMe, lockoutOnFailure: false);
    }
}