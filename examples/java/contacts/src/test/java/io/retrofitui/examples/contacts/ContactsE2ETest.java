package io.retrofitui.examples.contacts;

import com.microsoft.playwright.*;
import com.microsoft.playwright.options.WaitUntilState;
import org.junit.jupiter.api.*;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

@SpringBootTest(webEnvironment = RANDOM_PORT)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ContactsE2ETest {

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
        var response = page.navigate(url("/api/ui/contacts"));
        assertThat(response.status()).isEqualTo(200);
        assertThat(page.content()).contains("columns");
        assertThat(page.content()).contains("name");
    }

    @Test
    void spaIndexServesHtml() {
        var response = page.navigate(url("/retrofit-ui"));
        assertThat(response.status()).isEqualTo(200);
        assertThat(page.content()).contains("<div id=\"root\">");
    }

    @Test
    void tableRendersColumnHeadersAndSeedData() {
        page.navigate(url("/retrofit-ui#/contacts"),
            new Page.NavigateOptions().setWaitUntil(WaitUntilState.NETWORKIDLE));
        page.waitForSelector("table", new Page.WaitForSelectorOptions().setTimeout(10_000));

        assertThat(page.locator("th").filter(new Locator.FilterOptions().setHasText("Name")).count())
            .isGreaterThan(0);
        assertThat(page.locator("th").filter(new Locator.FilterOptions().setHasText("Email")).count())
            .isGreaterThan(0);
        assertThat(page.getByText("Alice Johnson").count()).isGreaterThan(0);
    }

    @Test
    void rowClickNavigatesToEditForm() {
        page.navigate(url("/retrofit-ui#/contacts"),
            new Page.NavigateOptions().setWaitUntil(WaitUntilState.NETWORKIDLE));
        page.waitForSelector("table", new Page.WaitForSelectorOptions().setTimeout(10_000));

        page.locator("tbody tr").first().click();
        page.waitForSelector("form", new Page.WaitForSelectorOptions().setTimeout(10_000));

        assertThat(page.locator("form").count()).isGreaterThan(0);
    }

    @Test
    void newButtonOpensCreateForm() {
        page.navigate(url("/retrofit-ui#/contacts"),
            new Page.NavigateOptions().setWaitUntil(WaitUntilState.NETWORKIDLE));
        page.waitForSelector("table", new Page.WaitForSelectorOptions().setTimeout(10_000));

        page.locator("sl-button").filter(new Locator.FilterOptions().setHasText("New")).click();
        page.waitForSelector("form", new Page.WaitForSelectorOptions().setTimeout(10_000));

        assertThat(page.locator("form").count()).isGreaterThan(0);
    }
}
