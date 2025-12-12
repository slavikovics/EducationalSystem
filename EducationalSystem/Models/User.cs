using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace EducationalSystem.Models;

public class User
{
    [Key]
    public long UserId { get; set; }
    
    [Required]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    public string Password { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    public UserStatus Status { get; set; } = UserStatus.Active;
    
    public string UserType { get; set; } = "User";
    
    public virtual ICollection<Material>? Materials { get; set; }
    
    [JsonIgnore]
    public virtual ICollection<Review>? Reviews { get; set; }
    public virtual ICollection<TestResult>? TestResults { get; set; }
}