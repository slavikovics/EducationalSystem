namespace EducationalSystem.Models;

public class Tutor : User
{
    public required int Experience { get; set; }
    public required string Specialty { get; set; }
}