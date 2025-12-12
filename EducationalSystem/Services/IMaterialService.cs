using EducationalSystem.Models;

namespace EducationalSystem.Services;

public interface IMaterialService
{
    Task<Material> CreateMaterial(long userId, DateTime createdAt, Content content, ContentCategory category);
    Task DeleteMaterial(long id);
    Task<Material> GetMaterialById(long id);
    Task<Material> UpdateContent(long id, Content newContent);
    Task<List<Material>> GetAllMaterials();
    Task<List<Material>> GetMaterialsByUserId(long userId);
}