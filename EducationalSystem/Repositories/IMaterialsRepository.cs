using EducationalSystem.Models;

namespace EducationalSystem.Repositories;

public interface IMaterialsRepository
{
    public Material CreateMaterial(long userId, DateTime creationDate, Content content);
    public void DeleteMaterial(long materialId);
    public Material UpdateContent(long materialId, Dictionary<string, object> newData);
    public List<Material> GetAllMaterials();
    public Material GetMaterialById(long id);
    public List<Material> GetMaterialsByUserId(long userId);
}