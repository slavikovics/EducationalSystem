using EducationalSystem.Models;

namespace EducationalSystem.Services;

public interface IMaterialService
{
    Material CreateMaterial(long userId, DateTime creationDate, Content content);
    void DeleteMaterial(long materialId);
    Material UpdateContent(long materialId, Dictionary<string, object> newData);
    List<Material> GetAllMaterials();
    Material GetMaterialById(long id);
    List<Material> GetMaterialsByUserId(long userId);
}