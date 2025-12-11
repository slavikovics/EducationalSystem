using System.Security.Cryptography;
using System.Text;
using EducationalSystem.Data;
using EducationalSystem.Models;

namespace EducationalSystem.Repositories;

public class AuthRepository : IAuthRepository
    {
        private readonly EducationalSystemDbContext _context;

        public AuthRepository(EducationalSystemDbContext context)
        {
            _context = context;
        }

        public User SaveUser(string email, string password, string name)
        {
            if (_context.Users.Any(u => u.Email == email))
                throw new InvalidOperationException("User with this email already exists");

            var user = new User
            {
                Email = email,
                Password = HashPassword(password),
                Name = name,
                Status = UserStatus.Active
            };

            _context.Users.Add(user);
            _context.SaveChanges();
            return user;
        }

        public void RefreshPassword(string oldPassword, string newPassword)
        {
            throw new NotImplementedException("Use specific user context for password refresh");
        }

        public void RefreshPassword(long userId, string oldPassword, string newPassword)
        {
            var user = _context.Users.Find(userId) 
                ?? throw new KeyNotFoundException("User not found");

            if (user.Password != HashPassword(oldPassword))
                throw new UnauthorizedAccessException("Invalid old password");

            user.Password = HashPassword(newPassword);
            _context.SaveChanges();
        }

        public User Login(string email, string password)
        {
            var user = _context.Users
                .FirstOrDefault(u => u.Email == email && u.Password == HashPassword(password))
                ?? throw new UnauthorizedAccessException("Invalid email or password");

            if (user.Status == UserStatus.Blocked)
                throw new UnauthorizedAccessException("User account is blocked");

            return user;
        }

        public void BlockUser(long userId, string accessKey)
        {
            var admin = _context.Admins.FirstOrDefault(a => a.AccessKey == accessKey)
                ?? throw new UnauthorizedAccessException("Invalid access key");

            var user = _context.Users.Find(userId)
                ?? throw new KeyNotFoundException("User not found");

            user.Status = UserStatus.Blocked;
            _context.SaveChanges();
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }