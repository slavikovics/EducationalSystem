using EducationalSystem.Models;

namespace EducationalSystem.DTOs;

public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public UserStatus Status { get; set; } = UserStatus.Active;
}