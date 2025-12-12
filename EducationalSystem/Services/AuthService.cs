using EducationalSystem.Data;
using EducationalSystem.Models;
using EducationalSystem.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace EducationalSystem.Services;

public class AuthService : IAuthService
{
    private readonly EducationalSystemDbContext _context;
    private readonly ITokenService _tokenService;

    public AuthService(EducationalSystemDbContext context, ITokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    public async Task<(User? User, string Token)> RegisterUserAsync(string email, string password, string name)
    {
        if (await _context.Users.AnyAsync(u => u.Email == email))
            return (null, string.Empty);

        var user = new User
        {
            Email = email,
            Password = password,
            Name = name,
            UserType = "User",
            Status = UserStatus.Active
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = _tokenService.GenerateToken(user);
        return (user, token);
    }

    public async Task<(Admin? Admin, string Token)> RegisterAdminAsync(string email, string password, string name,
        string accessKey)
    {
        if (await _context.Users.AnyAsync(u => u.Email == email))
            return (null, string.Empty);

        var admin = new Admin
        {
            Email = email,
            Password = password,
            Name = name,
            AccessKey = accessKey,
            Status = UserStatus.Active
        };

        _context.Users.Add(admin);
        await _context.SaveChangesAsync();

        var token = _tokenService.GenerateToken(admin);
        return (admin, token);
    }

    public async Task<(Tutor? Tutor, string Token)> RegisterTutorAsync(string email, string password, string name,
        int experience, string specialty)
    {
        if (await _context.Users.AnyAsync(u => u.Email == email))
            return (null, string.Empty);

        var tutor = new Tutor
        {
            Email = email,
            Password = password,
            Name = name,
            Experience = experience,
            Specialty = specialty,
            Status = UserStatus.Active
        };

        _context.Users.Add(tutor);
        await _context.SaveChangesAsync();

        var token = _tokenService.GenerateToken(tutor);
        return (tutor, token);
    }

    public async Task<(User? User, string Token)> LoginAsync(string email, string password)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email && u.Password == password);

        if (user == null || user.Status == UserStatus.Blocked)
            return (null, string.Empty);

        var token = _tokenService.GenerateToken(user);
        return (user, token);
    }

    public async Task<bool> ChangePasswordAsync(long userId, string oldPassword, string newPassword)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null || user.Password != oldPassword)
            return false;

        user.Password = newPassword;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> BlockUserAsync(long userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return false;

        user.Status = UserStatus.Blocked;
        await _context.SaveChangesAsync();
        return true;
    }

    public bool IsAdmin(User user)
    {
        return user.UserType == "Admin";
    }

    public bool IsTutor(User user)
    {
        return user.UserType == "Tutor";
    }
}