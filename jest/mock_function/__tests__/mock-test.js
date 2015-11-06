/**
 * Created by linxiaojie on 2015/10/13.
 */

describe("mock function ",function(){
    it("test mock function ",function(){

        var myMock = jest.genMockFunction();
        myMock(1);
        myMock('a','b');

        //function call history
        console.log(myMock.mock.calls);

        //the first argument of the  first call to myMock
        console.log(myMock.mock.calls[0][0]);

        //the second argument of the second call to myMock
        console.log(myMock.mock.calls[1][2]);
    });
});