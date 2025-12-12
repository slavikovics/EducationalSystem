using EducationalSystem.Models;

namespace EducationalSystem.Repositories;

public interface IMaterialsRepository
{
    Task<Material> CreateMaterial(long userId, DateTime creationDate, Content content, ContentCategory category);
    Task DeleteMaterial(long materialId);
    Task<List<Material>> GetAllMaterials();
    Task<Material> GetMaterialById(long id);
    Task<List<Material>> GetMaterialsByUserId(long userId);
    Task<Material> UpdateContent(long materialId, Content newContent);
}