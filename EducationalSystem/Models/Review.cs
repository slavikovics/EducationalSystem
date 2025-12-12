using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;

namespace EducationalSystem.Models;

public class Review
{
    [Key]
    public long ReviewId { get; set; }
    
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public ReviewType Type { get; set; }
    
    public long? ContentId { get; set; }
    public int? Rating { get; set; }
    
    public virtual Content? Content { get; set; }
    
    public long UserId { get; set; }
    
    public virtual User? User { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}