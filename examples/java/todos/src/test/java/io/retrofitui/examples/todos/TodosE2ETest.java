package io.retrofitui.examples.todos;

import com.microsoft.playwright.*;
import com.microsoft.playwright.options.AriaRole;
import com.microsoft.playwright.options.WaitUntilState;
import org.junit.jupiter.api.*;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

@SpringBootTest(webEnvironment = RANDOM_PORT)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class TodosE2ETest {

    @LocalServerPort
    int port;

    Playwright playwright;
    Browser browser;
    BrowserContext context;
    Page page;

    @BeforeAll
    void launchBrowser() {
        playwright = Playwright.create();
        browser = playwright.chromium().launch();
    }

    @AfterAll
    void closeBrowser() {
        browser.close();
        playwright.close();
    }

    @BeforeEach
    void newPage() {
        context = browser.newContext(new Browser.NewContextOptions()
            .setBaseURL("http://localhost:" + port));
        page = context.newPage();
    }

    @AfterEach
    void closePage() {
        page.close();
        context.close();
    }

    private String url(String path) {
        return "http://localhost:" + port + path;
    }

    @Test
    void retrofitJsonEndpointResponds() {
        var response = page.navigate(url("/retrofit.json"));
        assertThat(response.status()).isEqualTo(200);
        assertThat(page.content()).contains("apiBase");
    }

    @Test
    void tableSpecEndpointReturnsColumns() {
        var response = page.navigate(url("/api/ui/todos"));
        assertThat(response.status()).isEqualTo(200);
        assertThat(page.content()).contains("columns");
        assertThat(page.content()).contains("title");
    }

    @Test
    void spaIndexServesHtml() {
        var response = page.navigate(url("/retrofit-ui"));
        assertThat(response.status()).isEqualTo(200);
        assertThat(page.content()).contains("<div id=\"root\">");
    }

    @Test
    void tableRendersColumnHeadersAndSeedData() {
        page.navigate(url("/retrofit-ui#/todos"),
            new Page.NavigateOptions().setWaitUntil(WaitUntilState.NETWORKIDLE));
        page.waitForSelector("table", new Page.WaitForSelectorOptions().setTimeout(10_000));

        assertThat(page.locator("th").filter(new Locator.FilterOptions().setHasText("Title")).count())
            .isGreaterThan(0);
        assertThat(page.locator("th").filter(new Locator.FilterOptions().setHasText("Done")).count())
            .isGreaterThan(0);
        assertThat(page.getByText("Buy milk").count()).isGreaterThan(0);
    }

    @Test
    void eachRowHasEditAndDeleteButtons() {
        page.navigate(url("/retrofit-ui#/todos"),
            new Page.NavigateOptions().setWaitUntil(WaitUntilState.NETWORKIDLE));
        page.waitForSelector("table", new Page.WaitForSelectorOptions().setTimeout(10_000));

        var firstRow = page.locator("tbody tr").first();
        assertThat(firstRow.locator("sl-button").filter(
            new Locator.FilterOptions().setHasText("Edit")).count()).isGreaterThan(0);
        assertThat(firstRow.locator("sl-button").filter(
            new Locator.FilterOptions().setHasText("Delete")).count()).isGreaterThan(0);
    }

    @Test
    void deleteButtonRemovesRow() {
        page.navigate(url("/retrofit-ui#/todos"),
            new Page.NavigateOptions().setWaitUntil(WaitUntilState.NETWORKIDLE));
        page.waitForSelector("table", new Page.WaitForSelectorOptions().setTimeout(10_000));

        page.onDialog(dialog -> dialog.accept());

        page.locator("tbody tr").nth(1)
            .locator("sl-button")
            .filter(new Locator.FilterOptions().setHasText("Delete"))
            .click();

        page.waitForSelector("sl-alert", new Page.WaitForSelectorOptions().setTimeout(5_000));
        assertThat(page.locator("sl-alert")
            .filter(new Locator.FilterOptions().setHasText("Deleted successfully")).count())
            .isGreaterThan(0);

        page.waitForSelector("table", new Page.WaitForSelectorOptions().setTimeout(5_000));
        assertThat(page.getByText("Walk the dog").count()).isEqualTo(0);
    }

    @Test
    void saveInlineEditShowsToast() {
        page.navigate(url("/retrofit-ui#/todos"),
            new Page.NavigateOptions().setWaitUntil(WaitUntilState.NETWORKIDLE));
        page.waitForSelector("table", new Page.WaitForSelectorOptions().setTimeout(10_000));

        var firstRow = page.locator("tbody tr").first();
        firstRow.locator("sl-button").filter(new Locator.FilterOptions().setHasText("Edit")).click();

        firstRow.getByRole(AriaRole.TEXTBOX).first().fill("Toast test todo");
        firstRow.locator("sl-button").filter(new Locator.FilterOptions().setHasText("Save")).click();

        page.waitForSelector("sl-alert", new Page.WaitForSelectorOptions().setTimeout(5_000));
        assertThat(
            page.locator("sl-alert").filter(new Locator.FilterOptions().setHasText("Saved successfully")).count()
        ).isGreaterThan(0);
    }
}
