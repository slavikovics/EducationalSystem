using System.ComponentModel.DataAnnotations;

namespace EducationalSystem.Models;

public class Tutor : User
{
    [Required]
    public int Experience { get; set; }
    
    [Required]
    public string Specialty { get; set; } = string.Empty;
    
    public Tutor()
    {
        UserType = "Tutor";
    }
}