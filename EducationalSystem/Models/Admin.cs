namespace EducationalSystem.Models;

public class Admin : User
{
    public required string AccessKey { get; set; }
}