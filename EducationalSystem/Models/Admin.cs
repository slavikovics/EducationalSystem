using System.ComponentModel.DataAnnotations;

namespace EducationalSystem.Models;

public class Admin : User
{
    [Required]
    public string AccessKey { get; set; } = string.Empty;
    
    public Admin()
    {
        UserType = "Admin";
    }
}