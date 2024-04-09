import type {
  GetAllPoliticiansSearchParams,
  Politician,
  Statistics,
} from "@/types/politicians";

/**
 * Service class for managing operations related to politicians.
 */
class PoliticianService {
  private baseUrl: string;

  /**
   * Constructs a new PoliticianService instance.
   * @param baseUrl Base URL for API requests. Defaults to "http://localhost:8080".
   */
  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || "http://localhost:8080";
  }

  /**
   * Uploads a file containing politician data in bulk.
   * @param file The file to be uploaded.
   * @returns A Promise resolving to an object with a message indicating success.
   * @throws Error if the upload operation fails.
   */
  async bulkUpload(file: File): Promise<{ message: string }> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${this.baseUrl}/bulk`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to perform bulk upload");
    }

    return await response.json();
  }

  /**
   * Retrieves a list of politicians based on optional search parameters.
   * @param params Optional search parameters for filtering the results.
   * @returns A Promise resolving to an object containing politician data and total pages.
   * @throws Error if the fetch operation fails.
   */
  async getPoliticians(
    params?: GetAllPoliticiansSearchParams,
  ): Promise<{ data: Politician[]; total_pages: number }> {
    let url = `${this.baseUrl}/politicians`;

    if (params) {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.perPage)
        queryParams.append("per_page", params.perPage.toString());
      if (params.name) queryParams.append("name", params.name);
      if (params.party) queryParams.append("party", params.party);
      if (params.gender) queryParams.append("gender", params.gender);

      if (queryParams.toString() !== "") {
        url += `?${queryParams.toString()}`;
      }
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch politicians");
    }
    return await response.json();
  }

  /**
   * Retrieves a politician by their ID.
   * @param id The ID of the politician to retrieve.
   * @returns A Promise resolving to the politician object.
   * @throws Error if the politician is not found.
   */
  async getPoliticianById(id: number): Promise<Politician> {
    const response = await fetch(`${this.baseUrl}/politicians/${id}`);
    if (!response.ok) {
      throw new Error("Politician not found");
    }
    return await response.json();
  }

  /**
   * Updates a politician's data.
   * @param id The ID of the politician to update.
   * @param updatedPolitician The updated data for the politician.
   * @returns A Promise resolving to an object with a message indicating success.
   * @throws Error if the update operation fails.
   */
  async updatePolitician(
    id: string,
    updatedPolitician: Politician,
  ): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/politicians/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedPolitician),
    });
    if (!response.ok) {
      throw new Error("Failed to update politician");
    }
    return await response.json();
  }

  /**
   * Deletes a politician by their ID.
   * @param id The ID of the politician to delete.
   * @returns A Promise resolving to an object with a message indicating success.
   * @throws Error if the delete operation fails.
   */
  async deletePolitician(id: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/politicians/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete politician");
    }
    return await response.json();
  }

  /**
   * Retrieves statistics related to politicians.
   * @returns A Promise resolving to an object containing statistics data.
   * @throws Error if the retrieval operation fails.
   */
  async statistics(): Promise<Statistics> {
    const response = await fetch(`${this.baseUrl}/statistics`);
    if (!response.ok) {
      throw new Error("Failed to retrieve statistics");
    }
    return await response.json();
  }
}

// Create a singleton instance of PoliticianService
export const politicianService = new PoliticianService();
