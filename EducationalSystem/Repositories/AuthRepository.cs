using System.Security.Cryptography;
using System.Text;
using EducationalSystem.Data;
using EducationalSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace EducationalSystem.Repositories;

public class AuthRepository : IAuthRepository
{
    private readonly EducationalSystemDbContext _context;

    public AuthRepository(EducationalSystemDbContext context)
    {
        _context = context;
    }

    public async Task<User> SaveUserAsync(string email, string password, string name)
    {
        if (await _context.Users.AnyAsync(u => u.Email == email))
            throw new InvalidOperationException("User with this email already exists");

        var user = new User
        {
            Email = email,
            Password = HashPassword(password),
            Name = name,
            Status = UserStatus.Active,
            UserType = "User",
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task RefreshPasswordAsync(long userId, string oldPassword, string newPassword)
    {
        var user = await _context.Users.FindAsync(userId) 
            ?? throw new KeyNotFoundException("User not found");

        if (user.Password != HashPassword(oldPassword))
            throw new UnauthorizedAccessException("Invalid old password");

        user.Password = HashPassword(newPassword);
        await _context.SaveChangesAsync();
    }

    public async Task<User> LoginAsync(string email, string password)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email && u.Password == HashPassword(password))
            ?? throw new UnauthorizedAccessException("Invalid email or password");

        if (user.Status == UserStatus.Blocked)
            throw new UnauthorizedAccessException("User account is blocked");

        await _context.SaveChangesAsync();

        return user;
    }

    public async Task BlockUserAsync(long userId, long adminUserId)
    {
        var admin = await _context.Users
            .OfType<Admin>()
            .FirstOrDefaultAsync(a => a.UserId == adminUserId)
            ?? throw new UnauthorizedAccessException("Only admins can block users");

        var user = await _context.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("User not found");

        if (user.UserId == adminUserId)
            throw new InvalidOperationException("Admin cannot block themselves");

        user.Status = UserStatus.Blocked;
        await _context.SaveChangesAsync();
    }

    public async Task<bool> IsAdminAsync(long userId)
    {
        var user = await _context.Users.FindAsync(userId);
        return user != null && user.UserType == "Admin";
    }

    public async Task<bool> IsTutorAsync(long userId)
    {
        var user = await _context.Users.FindAsync(userId);
        return user != null && user.UserType == "Tutor";
    }

    public async Task<User?> GetUserByIdAsync(long userId)
    {
        return await _context.Users.FindAsync(userId);
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<List<User>> GetAllUsersAsync()
    {
        return await _context.Users
            .OrderBy(u => u.UserId)
            .ToListAsync();
    }

    public async Task<List<User>> GetActiveUsersAsync()
    {
        return await _context.Users
            .Where(u => u.Status == UserStatus.Active)
            .OrderBy(u => u.UserId)
            .ToListAsync();
    }

    public async Task<List<User>> GetBlockedUsersAsync()
    {
        return await _context.Users
            .Where(u => u.Status == UserStatus.Blocked)
            .OrderBy(u => u.UserId)
            .ToListAsync();
    }

    public async Task<bool> UpdateUserAsync(long userId, Action<User> updateAction)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return false;

        updateAction(user);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteUserAsync(long userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return false;

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ChangeUserTypeAsync(long userId, string newUserType)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return false;

        if (newUserType != "User" && newUserType != "Admin" && newUserType != "Tutor")
            throw new ArgumentException("Invalid user type");

        user.UserType = newUserType;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ChangeUserEmailAsync(long userId, string newEmail)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return false;

        if (await _context.Users.AnyAsync(u => u.Email == newEmail && u.UserId != userId))
            throw new InvalidOperationException("Email already in use");

        user.Email = newEmail;
        await _context.SaveChangesAsync();
        return true;
    }

    private string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(hashedBytes);
    }
}